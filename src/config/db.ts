import colors from "colors"
import mongoose from "mongoose";
import User, {IUser} from "../models/User";

export const connectDB = async () =>{
    try{
    
    const {connection} = await mongoose.connect(process.env.MONGO_URI!)
    const url = `${connection.host}:${connection.port}`

    console.log( colors.magenta.bold( `MongoDB online in ${url}`))
    } catch (error) {
        console.log( colors.bgRed.white.bold( "Error al conectar MongoDB"))
        process.exit(1)
    }
}
///////////////////////////////////////////////////////////////////////////////////////////
//////CODIGO PARA IMPLEMENTAR LIMPIEZA CON SCRIPTS RESET MONGODB//////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/**import colors from "colors"
import mongoose from "mongoose";
import User, {IUser} from "../models/User";
import resetMongoDB from "../scripts/resetMongoDB";

export const connectDB = async () =>{
    try{
    
    const {connection} = await mongoose.connect(process.env.MONGO_URI!)
    const url = `${connection.host}:${connection.port}`

    console.log( colors.magenta.bold( `MongoDB online in ${url}`))
    
    // Ejecutar limpieza y reseteo automático
    await resetMongoDB();
    
    } catch (error) {
        console.log( colors.bgRed.white.bold( "Error al conectar MongoDB"))
        process.exit(1)
    }
}**/