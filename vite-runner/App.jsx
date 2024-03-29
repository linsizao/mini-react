import React from './core/React.js'

// const App = React.createElement('div', { id: 'app', }, 'react')
// const App = <div>react</div>

// const App = <div>
//   <div>
//     1
//     <div>1-1
//       <div>div-111</div>
//       <div>div-111</div>
//       <div>div-111</div>
//     </div>
//   </div>
// </div>

// const App = () => <div>react</div>

let count = 0
let props = { id: '111' }
let status = false
let footCoun = 1
let barCoun = 1

const Foo = () => {
  console.log('Foo');

  const update = React.update()
  function onClick () {
    footCoun++
    // React.update()
    update()
  }

  return (
    <div>
      foo: {footCoun }
      <button onClick={onClick}>button</button>
    </div>
  )
}

const Bar = () => {
  console.log('Bar');
  const update = React.update()
  function onClick () {
    barCoun++
    // React.update()
    update()
  }

  return (
    <div>
      bar: {barCoun}
      <button onClick={onClick}>button</button>
    </div>
  )
}

// const bar = <div>bar</div>
// function Bar () {
//   return <div>bar</div>
// }
function Counter ({ num }) {
  console.log('Parent');

  const update = React.update()
  function handleClick () {
    count++
    props = {}
    status = !status
    // React.update()
    update()
  }

  return <div {...props}>
    {/* <p>num: {num}</p>
    <p>count: {count}</p> */}
    {/* <div>
      {status ? Foo : bar }
    </div> */}

    <button onClick={handleClick}>button</button>
    {/* {status && bar} */}
    <Foo />
    <Bar />
  </div>
}

const App = () => (<div>
  react
  <Counter num={10}></Counter>
</div>)

export default App
