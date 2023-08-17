import axios from "axios";
import express from 'express'

const app = express()
const PORT = 4000
app.listen(PORT,()=>{
    console.log('App is listening on port',PORT)
})
app.get('/open',async (req,res)=>{
let result = await openDomofon()
    if (result.status === 200){
        console.log('Домофон открыт',result.message)
        res.send(result.message)
    }
    else res.send(result.message)
})
    let  getToken = async ()=> {
        try {
            let promise = await axios.post('https://api-mh.ertelecom.ru/auth/v2/auth/780040122830/password', {
                "login" : "780040122830",
                "timestamp" : "2023-08-17T15:19:51.834000Z",
                "hash2" : "E7B72E8DE46C6796FCEF86CD41521599",
                "hash1" : "Y8Kt4y29AHRmJDZCtzGo1hYgJaw="
            }, {
                headers: {
                    'content-type': 'application/json',
                },
            })

            return ({status:promise.status, token:promise.data.accessToken})
        }
        catch (error){
            console.log('Получение токена',error.response.status,error.message)
            return ({status: error.response.status,message: error.message})
        }
    }

let openDomofon = async ()=> {
    const TOKEN = await getToken()

    if (TOKEN.status===200) {
        try {
            let promise = await axios.post('https://api-mh.ertelecom.ru/rest/v1/places/5626227/accesscontrols/63309/actions', {"name": "accessControlOpen"}, {
                headers: {
                    authorization: `Bearer ${TOKEN.token}`,
                    'content-type': 'application/json',
                    operator: 2
                },
            })
            console.log(promise.data.data)
            if(promise.data.data.status){
                return {status:200,message:'Домофон открыт'}
            }
            else  return {status:promise.data.data.status,message:promise.data.data.errorMessage}

        } catch (error) {
            console.log('Открытие домофона',error.response.status,error.message)
            return {status: error.response.status, message: error.message}
        }
    }
    else return {status:TOKEN.status,message:TOKEN.message}
}
