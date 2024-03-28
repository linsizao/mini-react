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
  console.log('currentRoot', currentRoot);
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }

   nextWorkOfUnit = wipRoot
}

// 工作循环
function workLoop (deadline) {
  let shouldYield = false
  console.log('shouldYield', shouldYield);
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

function commitRoot () {
  commitWork(wipRoot.child)

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
          console.log('dom', dom);
          dom[key] = newProps[key]
        }
      }
    }
  })
}

function reconcileChildren (fiber, children) {
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

    // 指向兄弟节点?
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }
    prevChild = newFiber
  })
}

function isFunction (v) {
  return typeof v === 'function'
}

function updateFunctioComponent (fiber) {
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
  createElement
}

export default React
