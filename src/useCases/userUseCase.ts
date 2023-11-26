import User from "../entities/user"
import UserRepository from "../frameworks/repository/user.repository"
import Encrypt from "../frameworks/passwordServices.ts/hashPassword"
import JWTtoken from "../frameworks/passwordServices.ts/jwt"

class UserUsecase {
    private userRepository: UserRepository
    private encrypt:Encrypt
    private jwtToken:JWTtoken
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
        this.encrypt= new Encrypt()
        this.jwtToken=new JWTtoken()
    }

    async register(user: User) {
        try {
            const newPassword = await this.encrypt.createHash(user.password);

            const NewUser:User={
             username: user.username,
             email: user.email,
             password: newPassword,
             phone:user.phone,
            }
            const response = await this.userRepository.create(NewUser)
            
            if (response.success) {
                return {
                    status: 200,
                        success: true,
                        message: response.message,
                        user:response.user
                }
            } else {
                return {
                    status: 500,
                        success: false,
                        message: response.message,}
            }
        } catch (error) {
            return {
                status: 500,
                    success: false,
                    message: "server error"
                
            }
        }
    }

    async login(credentials:{email: string; password: string}){
        try {

            const {email,password}=credentials

            // console.log("hleeeeeeeeeeeeeee");
            

            const response=await this.userRepository.findByEmail(email)
            
            if (response.success) {
                const storedUser  = response.user;

                if (storedUser && storedUser.password) {
                    const passwordMatch = await this.encrypt.compare(password,storedUser.password);

                    if (!passwordMatch) {
                        // Incorrect password
                        return {
                            status: 401,
                            success: false,
                            message: "Invalid credentials",
                        };
                    }


                    // Password is correct

                    const userId = storedUser?._id?.toString() || '';
                    const role=storedUser?.role || ''
                    const token = this.jwtToken.createJWT(userId,role);
                    return {
                        token,
                        status: 200,
                        user: storedUser,
                        success: true,
                        message: "Login successful",

                    };
                } else {
                    // User or password not found
                    return {
                        status: 401,
                        data: {
                            success: false,
                            message: "Invalid credentials",
                        },
                    };
                }
            } else {
                
                return {
                    status: 400,
                    data: {
                        success: false,
                        message: response.message,
                    },
                };
            }
        } catch (error) {
            return{ 
                status:500,
                success: false,
                message: "Internal server error. Please try again later.",
            }
        }
    }



    async updateUser(id: string, updatedUser: any) {
        try {
            const response = await this.userRepository.findByIdAndUpdate(id,updatedUser);
    
            if (response.success) {
                return {
                    status: 200,
                    success: true,
                    message: "Updated successfully",
                    updatedUser
                };
            } else {
                return {
                    status: 400,
                    success: false,
                    message: response.message,
                };
            }
        } catch (error:any) {
            console.error(error.message);
            return {
                status: 500,
                success: false,
                message: "Internal server error. Please try again later.",
            };
        }
    }
    
}

export default UserUsecase