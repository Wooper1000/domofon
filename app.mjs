import axios from "axios";

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
            return (promise.data.accessToken)
        }
        catch (error){
            console.log(error.response,error.message)
        }
    }

let openDomofon = async ()=> {
    const TOKEN = await getToken()
    console.log(TOKEN)
    try {
        let promise = await axios.post('https://api-mh.ertelecom.ru/rest/v1/places/5626227/accesscontrols/63309/actions', {"name": "accessControlOpen"}, {
            headers: {
                authorization: `Bearer ${TOKEN}`,
                'content-type': 'application/json',
                operator: 2
            },
        })
        console.log(promise.data)
    }
    catch (error){
        console.log(error.response.status,error.message)
    }
}

openDomofon()
