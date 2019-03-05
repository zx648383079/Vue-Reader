interface Shape {
  id: number
  quantity: number
}


export interface State {
  added: Shape[]
}

// initial state
// shape: [{ id, quantity }]
const initState: State = {
  added: [],
}

// getters
const getters = {
}

// actions
const actions = {
}

// mutations
const mutations = {
}

export default {
  state: initState,
  getters,
  actions,
  mutations,
}
