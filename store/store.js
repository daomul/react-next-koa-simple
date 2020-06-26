import { createStore, combineReducers, applyMiddleware } from "redux"
import ReduxThunk from "redux-thunk"
import { composeWithDevTools } from "redux-devtools-extension"
import axios from "axios"


const userState = {}

const LOGOUT = "LOGOUT"

function userReduce(state = userReduce, action) {
    switch (action.type) {
        case LOGOUT:
            return {}
        default:
            return state
    }
}

const allReducer = combineReducers({
    user: userReduce
})

// logout action creater
export function logout() {
    return dispatch => {
        axios.post("/logout").then(res => {
            if (res.status === 200) {
                dispatch({
                    type: LOGOUT
                })
            } else {
                console.log("logout error:", err)
            }
        }).catch(err => {
            console.log("logout error: ", err)
        })
    }
}

export default function initStore(state) {
    const store = createStore(
        allReducer,
        Object.assign({}, {
            user: userState
        }, state),
        composeWithDevTools(applyMiddleware(ReduxThunk))
    )
    return store
}
