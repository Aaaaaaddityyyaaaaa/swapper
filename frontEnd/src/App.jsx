import { Router, RouterContextProvider } from "react-router"
import { createRoutesFromElements,createBrowserRouter, Route ,RouterProvider} from "react-router"
import Header from "./componenets/Header"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Dashboard, { dashboardLoader } from "./pages/Dashboard"
import Marketplace from "./pages/MarketPlace"

function App() {
  const router =  createBrowserRouter(
    createRoutesFromElements(<>
    <Route path = "/" element={<Header/>}>
    <Route index element={<Signup/>}/>
    <Route path="login" element={<Login/>}/>    
    <Route path="dashboard" element={<Dashboard/>} loader={dashboardLoader}/>
    <Route path="marketplace" element={<Marketplace/>}/>
    </Route>
    </>)
  )
  return <RouterProvider router={router}></RouterProvider> 
}

export default App
