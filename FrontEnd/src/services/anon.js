export default {

    //SK ICI DOIT REJOINDRE TASK DU COUP ?
    createAnonRobot(anonymizeArray, username){
        
        const createAnonRobotOption = {
            method: 'POST', 
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(anonymizeArray)
        }
        
        return fetch('/api/robot/' + username + '/anonymize', createAnonRobotOption ).then(answer => {
            if (!answer.ok) {throw answer}
            return answer.json()
        }).catch(error => {
            throw error
        })

    }

}