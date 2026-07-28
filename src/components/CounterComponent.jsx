import { useState } from "react"

export default function CounterComponent() {
  
  const [count, setCount] = useState(0);
  return (
    <div>

      <h1>My Count: {count} </h1>

       <button className="border p-4 rounded bg-blue-500" 
       onClick={()=> setCount(count + 1)}
       >Increment</button>

       <button className="border p-4 rounded bg-red-500"
       onClick={()=> setCount(
        count <= 0 ? 0 : count-1
       )}
       >Decrement</button>
      
    </div>
  )
}
