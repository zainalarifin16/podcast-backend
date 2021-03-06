import { ApiModelProperty } from "@nestjs/swagger";
import { Column, OneToMany } from "typeorm";
import { Playlist } from "../../Playlist/entities/Playlist";
import { Podcast } from "../../Podcast/entities/Podcast";

export class UserDto{
    
    @ApiModelProperty()
    id: number;

    @ApiModelProperty()
    @Column({length: 150})
    email: string;

    @ApiModelProperty()
    @Column({length: 150})
    username: string;
    
    @ApiModelProperty()
    password: string;

    @OneToMany( type => Playlist, playlist => playlist.user )
    playlists: Playlist[];

    @OneToMany( type => Podcast, podcast => podcast.user)
    podcasts: Podcast[];

}
