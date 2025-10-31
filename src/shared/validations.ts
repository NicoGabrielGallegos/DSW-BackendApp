export function isValidEmail(email: string) {
    let regex = /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z]+[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/
    return regex.test(email)
}