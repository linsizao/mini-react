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


function Counter ({ num }) {
  function handleClick () {
    console.log('handleClick');
  }
  return <div >count: {num} <button onClick={handleClick}>button</button></div>
}

function CountConainer () {
  return <Counter></Counter>

}

const App = () => (<div>
  react
  <Counter num={10}></Counter>
</div>)

export default App
