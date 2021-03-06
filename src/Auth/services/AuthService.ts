import { JwtService } from '@nestjs/jwt';
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { User } from "../../User/entities/User";
import { VerifyDto } from '../entities/verify.dto';

const keySecret = "Doremi3TanggaNada";

@Injectable()
export class AuthService{
    constructor(
        private readonly jwtService: JwtService,
    ) {}

    async createToken(user: User){

        const expiresIn = 3600;
        const accessToken = this.jwtService.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            playlists: user.playlists,
            podcasts: user.podcasts
        });

        return {
            expiresIn,
            accessToken
        }
    }

    async validateUser(verify: VerifyDto){
        console.log(verify);
        try{
            const result = {...this.jwtService.verify(verify.token), accessToken: verify.token};
            return result;
        }catch(error){
            throw new HttpException("Not valid token", HttpStatus.BAD_REQUEST);
        }
    }

}