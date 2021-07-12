const DATA = []

exports.FindOrCreate = (user) => {
    if (CheckUser(user)) {  // if user exists then return user
        return user
    } else {
        DATA.push(user) // else create a new user
    }
}
 const CheckUser = (input) => {
    for (const i in DATA) {
        if (input.email == DATA[i].email && input.name == DATA[i].name) {
            return true
        }
    }
    return false
}

exports.CheckUser = CheckUser