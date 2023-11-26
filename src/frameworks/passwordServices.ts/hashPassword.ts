import bcrypt from 'bcryptjs'
import Hashpassword from '../../useCases/types/hashpassword'

class Encrypt implements Hashpassword{

    constructor(){
    
    }


    async createHash(password: string): Promise<string> {
        
        const saltRounds=10

        const salt=await bcrypt.genSalt(saltRounds)

        const hashPassword=await bcrypt.hash(password,salt)

        return hashPassword
    }

    async compare(password: string, hashpassword: string): Promise<boolean> {
        const passwordMatch=await bcrypt.compare(password,hashpassword)
        return passwordMatch
    }


}

export default Encrypt