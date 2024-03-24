function workLoop (deadline) {
  let tarkId = 1

  let shouldYield = false
  while (!shouldYield) {
    // run task
    console.log('tarkId:', tarkId, 'time:', deadline.timeRemaining());
    // dom
    shouldYield = deadline.timeRemaining() < 1
    tarkId++
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
