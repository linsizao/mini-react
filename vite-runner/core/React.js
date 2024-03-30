function createTextNode (text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement (type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode = ['string', 'number'].includes(typeof child)
        return isTextNode ? createTextNode(child) : child
      })
    }
  }
}


// 下一个工作单元
let nextWorkOfUnit = null
// 根节点( work in progress)
let wipRoot = null
// 当前根节点
let currentRoot = null
// 要删除节点数组
let deletions = []
let wipFiber = null

function render (el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }

  nextWorkOfUnit = wipRoot
}

function update () {
  let currentFiber = wipFiber

  return () => {
    console.log('currentFiber', currentFiber);
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextWorkOfUnit = wipRoot
  }
}

let stateHooks = []
let stateHookIndex = 0

function useState (initial) {
  let currentFiber = wipFiber
  const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex]
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [] // 队列
  }

  // 执行队列修改 state
  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state)
  })
  stateHook.queue = []

  // 记录和添加 stateHook
  stateHookIndex++
  stateHooks.push(stateHook)
  currentFiber.stateHooks = stateHooks

  function setState (action) {
    // action 值一样不更新
    const eagerState = typeof action === 'function' ? action() : action
    if (eagerState === stateHook.state) return

    stateHook.queue.push(typeof action === 'function' ? action : () => action)

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextWorkOfUnit = wipRoot
  }

  return [stateHook.state, setState]
}

// 工作循环
function workLoop (deadline) {
  let shouldYield = false
  console.log('shouldYield', shouldYield);
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      console.log('hit', wipRoot, nextWorkOfUnit);
      nextWorkOfUnit = undefined
    }

    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

// 删除节点
function commitDeletion (fiber) {
  // console.log('fiber', fiber);
  if (fiber.dom) {
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent
    }
    fiberParent.dom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child)
  }
}

function commitRoot () {
  deletions.forEach(commitDeletion) // 删除节点
  commitWork(wipRoot.child)

  deletions = []
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork (fiber) {
  if (!fiber) return

  let fiberParent = fiber.parent
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  } else {
    fiber.dom && fiberParent.dom.append(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom (type) {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type)
}

function updateProps (dom, newProps, prevProps) {
  // 1、删除 prop
  Object.keys(prevProps).forEach((key) => {
    if (key !== 'children') {
      if (!newProps[key]) {
        dom.removeAttribute(key)
      }
    }
  })

  // prop 不同
  Object.keys(newProps).forEach((key) => {
    if (key !== 'children') {
      if (newProps[key] !== prevProps[key]) {
        if (key.startsWith('on')) {
          const eventType = key.slice(2).toLocaleLowerCase()
          dom.removeEventListener(eventType, prevProps[key])
          dom.addEventListener(eventType, newProps[key])
        } else {
          // console.log('dom', dom);
          dom[key] = newProps[key]
        }
      }
    }
  })
}

function reconcileChildren (fiber, children) {
  // console.log('fiber', fiber);
  let oldFiber = fiber.alternate?.child
  let prevChild = null

  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type
    let newFiber = null

    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: 'update',
        alternate: oldFiber
      }
    } else {
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          parent: fiber,
          child: null,
          sibling: null,
          dom: null,
          effectTag: 'placement'
        }
      }

      // 把旧的添加进删除数组
      if (oldFiber) {
        deletions.push(oldFiber)
      }
    }

    // 指向兄弟节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }

    // 记录前一个节点
    if (newFiber) {
      prevChild = newFiber
    }
  })

  // 将多余的老节点添加进删除数组
  while (oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

function isFunction (v) {
  return typeof v === 'function'
}

function updateFunctioComponent (fiber) {
  wipFiber = fiber
  // 重置 state
  stateHooks = []
  stateHookIndex = 0
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHookComponent (fiber) {
  if (!fiber.dom) {
    const dom = fiber.dom = createDom(fiber.type)
    // fiber.parent.dom.append(dom)

    if (fiber.props) updateProps(dom, fiber.props, {})
  }

  const children = fiber.props.children
  reconcileChildren(fiber, children)

}

// 处理工作单元
function performWorkOfUnit (fiber) {
  // console.log('fiber', fiber)
  const isFunctioComponent = isFunction(fiber.type)
  isFunctioComponent ? updateFunctioComponent(fiber) : updateHookComponent(fiber)

  if (fiber.child) return fiber.child
  // if (fiber.sibling) return fiber.sibling

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
}

requestIdleCallback(workLoop)

const React = {
  render,
  update,
  useState,
  createElement
}

export default React
