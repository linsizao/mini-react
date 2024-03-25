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
        console.log('child', child)
        const isTextNode = ['string', 'number'].includes(typeof child)
        return isTextNode ? createTextNode(child) : child
      })


    }
  }
}

function render (el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }

  root = nextWorkOfUnit
}

// 下一个工作单元
let nextWorkOfUnit = null
// 根节点
let root = null

// 工作循环
function workLoop (deadline) {
  let shouldYield = false
  console.log('shouldYield', shouldYield);
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextWorkOfUnit && root) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

function commitRoot () {
  commitWork(root.child)
}

function commitWork (fiber) {
  if (!fiber) return

  let fiberParent = fiber.parent
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }
  fiber.dom && fiberParent.dom.append(fiber.dom)

  commitWork(fiber.child)
  commitWork(fiber.sibling)

  root = null
}

function createDom (type) {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type)
}

function updateProps (dom, props) {
  Object.keys(props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = props[key]
    }
  })
}

function initChilder (fiber, children) {
  // const children = fiber.props.children
  let prevChild = null
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      child: null,
      sibling: null,
      dom: null
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
  initChilder(fiber, children)
}

function updateHookComponent (fiber) {
  if (!fiber.dom) {
    const dom = fiber.dom = createDom(fiber.type)
    // fiber.parent.dom.append(dom)

    if (fiber.props) updateProps(dom, fiber.props)
  }

  const children = fiber.props.children
  initChilder(fiber, children)

}

// 处理工作单元
function performWorkOfUnit (fiber) {
  console.log('fiber', fiber)
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
  createElement
}

export default React
