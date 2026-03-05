import type { Request, Response } from "express"
import { Result, validationResult } from "express-validator"
import slug from "slug"
import formidable from "formidable"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auths"
import { generateJWT } from "../utils/jwt"
import cloudinary from "../config/cloudinary"
import { v4 as uuid } from "uuid"
import { format } from "path"
import { log } from "console"


export const createAccount = async (req: Request, res: Response) => { // Esta es la mejor manera
    //vamos a hacer esto antes crear user para comprobar si un usuario ha sido registrado sin llegar a la DB


    const { email, password, } = req.body

    const userExist = await User.findOne({ email })
    if (userExist) {
        const error = new Error("Un usuario con ese email ya esta registrado")
        return res.status(409).json({ error: error.message })
    }


    const handle = slug(req.body.handle, "")
    const handleExists = await User.findOne({ handle })
    if (handleExists) {
        const error = new Error("Nombre de usuario no disponible")
        return res.status(409).json({ error: error.message })
    }



    const user = new User(req.body)
    user.password = await hashPassword(password)
    user.handle = handle


    await user.save()
    res.status(201).send("Registro creado exitosamente")

}

export const login = async (req: Request, res: Response) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, } = req.body
    //revisar si el usuario esta registrado.
    const user = await User.findOne({ email })
    if (!user) {
        const error = new Error("El usuario no existe")
        return res.status(404).json({ error: error.message })
    }

    //comprobar el password
    const isPasswordCorrect = await checkPassword(password, user.password)
    if (!isPasswordCorrect) {
        const error = new Error("Password incorrecto")
        return res.status(401).json({ error: error.message })
    }

    const token = generateJWT({ id: user._id })

    res.send(token)
}

export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)

}

/*export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description, links  } = req.body
        const handle = slug(req.body.handle, "")
        const handleExists = await User.findOne({ handle })
        if (handleExists && handleExists.email !== req.user!.email) {
            const error = new Error("Nombre de usuario no disponible")
            return res.status(409).json({ error: error.message })
        }
        //actualizar el usuario
        req.user!.description = description
        req.user!.handle = handle
        req.user!.links = JSON.stringify(Array.isArray(links) ? links : JSON.parse(links))
        await req.user!.save()
        res.send("Perfil actualizado correctamente")

    } catch (e) {
        const error = new Error("Hubo un error")
        return res.status(500).json({ error: error.message })
    }
}*/
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description, links } = req.body
        const handle = slug(req.body.handle, "")
        const handleExists = await User.findOne({ handle })
        if (handleExists && handleExists.email !== req.user!.email) {
            const error = new Error("Nombre de usuario no disponible")
            return res.status(409).json({ error: error.message })
        }

        // Parsear links si es string
        let parsedLinks = Array.isArray(links) ? links : JSON.parse(links || "[]")

        // Agregar id a cada link habilitado
        const linksWithId = parsedLinks.map((link: any, index: number) => ({
            ...link,
            id: link.enabled ? (link.id || index + 1) : 0
        }))

        req.user!.description = description
        req.user!.handle = handle
        req.user!.links = JSON.stringify(linksWithId)
        await req.user!.save()
        res.send("Perfil actualizado correctamente")

    } catch (e) {
        const error = new Error("Hubo un error")
        return res.status(500).json({ error: error.message })
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    const form = formidable({ multiples: false })

    try {
        form.parse(req, (error, fields, files) => {

            cloudinary.uploader.upload(files.file![0].filepath, { public_id: uuid() }, async function (error, result) {

                if (error) {
                    const error = new Error("Hubo un error al subir la imagen")
                    return res.status(500).json({ error: error.message })
                }
                if (result) {
                    req.user!.image = result.secure_url
                    await req.user!.save()
                    res.json({ image: result.secure_url })
                }

            })
        })

    } catch (e) {
        const error = new Error("Hubo un error")
        return res.status(500).json({ error: error.message })
    }

}

export const getUserByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.params
        const user = await User.findOne({ handle }).select("-_id -__v -email -password")
        if (!user) {
            const error = new Error("El usuario no existe")
            return res.status(404).json({ error: error.message })

        }

        res.json(user)
    } catch (e) {
        const error = new Error("Hubo un error")
        return res.status(500).json({ error: error.message })
    }
}
export const SearchByHandle = async (req: Request, res: Response) => {
    try {

        const { handle } = req.params

        console.time("handleQuery")

        const userExist = await User.findOne({ handle })

        console.timeEnd("handleQuery")

        if(userExist){
            return res.status(409).json({
                error: `${handle} ya esta registrado`
            })
        }

        res.json({
            message: `${handle} esta disponible`
        })

    } catch (error) {

        res.status(500).json({
            error: "Hubo un error"
        })

    }
}


