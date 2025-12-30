import bcrypt from "bcrypt"

export const hashPassword = async(password : string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password,salt)
}

//comprobar el password con el ya hasheado

export const checkPassword = async (enterpassword: string, hash: string ) => {
   
    return await bcrypt.compare(enterpassword,hash) 

}