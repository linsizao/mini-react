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


function Counter ({num}) {
  return <div>count: {num}</div>
}

function CountConainer () {
  return <Counter></Counter>

}

const App = () => (<div>
  react
  <Counter num={10}></Counter>
  <Counter num={20}></Counter>
</div>)

export default App
