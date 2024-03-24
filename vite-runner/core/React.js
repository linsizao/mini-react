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
      children: children.map((child) =>
        typeof child === 'string' ? createTextNode(child) : child)
    }
  }
}

function render (el, container) {

  console.log('render');
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
}

// 下一个工作单元
let nextWorkOfUnit = null

// 工作循环
function workLoop (deadline) {
  let shouldYield = false
  console.log('shouldYield', shouldYield);
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workLoop)
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

function initChilder (fiber) {
  const children = fiber.props.children
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

// 处理工作单元
function performWorkOfUnit (fiber) {
  console.log('fiber', fiber)
  if (!fiber.dom) {
    const dom = fiber.dom = createDom(fiber.type)
    fiber.parent.dom.append(dom)

    if (fiber.props) updateProps(dom, fiber.props)
  }

  initChilder(fiber)

  if (fiber.child) return fiber.child
  if (fiber.sibling) return fiber.sibling

  let parent = fiber.parent
  while (parent) {
    if (parent.sibling) return parent.sibling
    parent = parent.parent
  }
}

requestIdleCallback(workLoop)

const React = {
  render,
  createElement
}

export default React
