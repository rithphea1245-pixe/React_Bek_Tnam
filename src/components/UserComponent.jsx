
// external style
import '../styles/test.css'

// function component 
export function UserComponent({name,gender,position}){
   return (
    // jsx
    <>
      <h1>Name: {name} </h1>
      <h2>Gender: {gender}</h2>
      <hr />
      <h4>Position: {position}</h4>
    </>
   )
}
