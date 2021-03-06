import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, UpdateResult, Like } from 'typeorm';
import { Podcast } from '../entities/Podcast';
import { User } from '../../User/entities/User';
import { PodcastRepository } from '../repositories';
import { UserRepository } from '../../User/repositories';

@Injectable()
export class PodcastService {
  constructor(
    @InjectRepository(Podcast)
    private readonly podcastRepository: PodcastRepository,
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(): Promise<Podcast[]> {
    return await this.podcastRepository.find();
  }

  async feedPodcast(idUser: number): Promise<any> {
    const dataUser = await this.userRepository.findOne({
      where: { id: idUser },
      relations: ['followings', 'podcasts'],
    });
    let resultPodcast = dataUser.podcasts;
    for (let index = 0; index < dataUser.followings.length; index++) {
      const userPodcast = await this.userRepository.findOne({
        where: { id: dataUser.followings[index].id },
        relations: ['podcasts'],
      });
      // console.log(resultPodcast);
      // console.log(userPodcast.podcasts);
      if (userPodcast.podcasts.length > 0) {
        if (resultPodcast.length > 0) {
          // console.log("Following have feeds", resultPodcast);
          resultPodcast = resultPodcast.concat(userPodcast.podcasts);
          // console.log( resultPodcast );
        } else {
          resultPodcast = userPodcast.podcasts;
          // console.log("Following no have feeds", resultPodcast);
        }
      }
    }

    return resultPodcast;
  }

  async findDetail(idPodcast: number): Promise<Podcast> {
    const dataPodcast = await this.podcastRepository.findOne({
      where: { id: idPodcast },
      relations: ['user', 'playlists'],
    });
    // console.log("dataPodcast", idPodcast, dataPodcast);
    return dataPodcast;
  }

  async searchPodcast(titlePodcast: string): Promise<Podcast[]> {
    return await this.podcastRepository.find({
      title: Like(`%${titlePodcast}%`),
    });
  }

  async create(id: number, podcast: Podcast): Promise<Podcast> {
    if (podcast.duration.length == 0) {
      throw new HttpException('Duration is required', HttpStatus.BAD_REQUEST);
    }
    const durationFormat = /[0-9]{2}m[0-9]{2}s/;
    if (!durationFormat.test(podcast.duration)) {
      throw new HttpException(
        'Duration format is invalid',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (podcast.youtubeLink.length == 0) {
      throw new HttpException(
        'Link Youtube is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const youtubeLinkFormat = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

    if (!youtubeLinkFormat.test(podcast.youtubeLink)) {
      throw new HttpException(
        'Link Youtube have invalid format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepository.findOne(id);

    const entryPodcast = new Podcast();
    entryPodcast.title = podcast.title.length === 0 ? 'Untitled' : podcast.title;
    entryPodcast.duration = podcast.duration;
    entryPodcast.description = podcast.description;
    entryPodcast.youtubeLink = podcast.youtubeLink;
    entryPodcast.user = user;

    const newPodcast = await this.podcastRepository.save(entryPodcast);

    return newPodcast;
  }

  async update(
    idUser: number,
    idPodcast: number,
    podcast: Podcast,
  ): Promise<UpdateResult> {
    const dataUser = await this.userRepository.findOne({
      where: { id: idUser },
      relations: ['podcasts'],
    });

    const checkExistPodcast = dataUser.podcasts.filter(
      data => data.id === idPodcast,
    );

    if (!!!checkExistPodcast) {
      throw new HttpException(
        "You don't have previllage to edit this podcast ",
        HttpStatus.BAD_REQUEST,
      );
    }

    const dataPodcast = await this.podcastRepository.findOne(idPodcast);
    if (!!!dataPodcast) {
      // console.log("throw new HttpException");
      throw new HttpException("Podcast doesn't exist", HttpStatus.BAD_REQUEST);
    }

    return await this.podcastRepository.update(idPodcast, podcast);
  }

  async delete(id): Promise<DeleteResult> {
    const dataPodcast = await this.podcastRepository.findOne(id);
    if (!!!dataPodcast) {
      // console.log("throw new HttpException");
      throw new HttpException("Podcast doesn't exist", HttpStatus.BAD_REQUEST);
    }

    return await this.podcastRepository.delete(parseInt(id));
  }
}
