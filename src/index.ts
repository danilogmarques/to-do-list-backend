import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserDB } from './types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        const result = await db("users")
        res.status(200).send({ message: "Pong!", result })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined 

        if (searchTerm === undefined) {
            const result = await db("users")
            res.status(200).send(result)
        } else {
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
        const { id, name, email, password } = req.body

        if (typeof id !== "string" ) {
            res.status(400)
            throw new Error("'id' deve ser string")
        } 

        if (id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")
        }

        if (typeof name !== "string" ) {
            res.status(400)
            throw new Error("'id' name ser string")
        }
        
        if (name.length < 4) {
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 4 caracteres")
        }

        if (typeof password !== "string" ) {
            res.status(400)
            throw new Error("'password' name ser string")
        }
        
        if (password.length < 4) {
            res.status(400)
            throw new Error("'password' deve possuir pelo menos 4 caracteres")
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}

        const [ userIdAlreadyExistis ]: TUserDB[] | undefined[] = await db("users").where({ id })

        if (userIdAlreadyExistis) {
            res.status(400)
            throw new Error("'id' já existe")
        }

        const [ userEmailAlreadyExistis ]: TUserDB[] | undefined[] = await db("users").where({ email })
            
        if (userEmailAlreadyExistis) {
            res.status(400)
            throw new Error("'email' já existe")
        }

        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }

        await db("users").insert(newUser)

        res.status(201).send({
            message: "User criado com sucesso",
            user: newUser
        })

	




    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id 

        const [ userIdAlreadyExists ]: TUserDB[] | undefined[] = await db("users").where({ id: idToDelete })

        if (idToDelete[1] !== "f") {
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 'f'")
        }

        if(!userIdAlreadyExists) {
            res.status(404)
            throw new Error("'id' não encontrado")
        }

        await db("users").del().where({ id: idToDelete })

        res.status(200).send({ message: "User deletado com sucesso" })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})