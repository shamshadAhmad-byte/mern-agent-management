import { createContext } from "react";

const context=createContext(null);
export default context;
export function ContextProvider(props){
    const url="http://localhost:5000/api"
    return (
        <context.Provider value={{
            url:url
        }}>
            {props.children}
        </context.Provider>
    )
}