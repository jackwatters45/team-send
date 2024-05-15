# Team Send

Easily send targeted bulk SMS to groups. Made for unconventional teams.

View live site: [Team Send](https://teamsend.yatusabes.co/)

![Send Message Example](<https://res.cloudinary.com/drheg5d7j/image/upload/v1714271048/ts-group-send-dark_loyysm.webp>)

## Design

Team Send was born out of the challenge of collecting rent from 30 college-age males in a frat house. Innitially a simple python script that read a csv and send an SMS message to each tenant with the amount due. The initial project nearly completely eliminated late rent payments and made my life as housing manager much easier.

Fast forward to today, Team Send is a full fledged web app that allows you to easily send targeted bulk SMS, email, and GroupMe messages to groups. It's made for unconventional teams that need to send messages to groups of people with different contact preferences. Users can create groups, add members, and send messages to the entire group or to specific members. Messages can be scheduled, users can set up to 3 reminders, and messages can be sent in recurring intervals.

### Tech

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)

### Optimizations

- Qstash for message queueing to both speed up send process and all for delayed sends
- Pusher for real-time updates to message status and error handling of scheduled, recurring, and reminder messages

## Roadmap

- [ ] Usage Docs
- [ ] Better GroupMe concurrency considerations
- [ ] Optomisitc UI updates
- [ ] Templating for messages
- [ ] Optional OpenAI message generation
- [ ] Importing group data
- [ ] Organizations
- [ ] Whatsapp integration
- [ ] App router

See the open issues for a full list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated. I (jackwatters45) am currently the sole contributor to this project. I am open to contributions and would love to see this project grow.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License

Distributed under the MIT License. See LICENSE for more information.

## Contact

Jack Watters - [LinkedIn](https://www.linkedin.com/in/john-watters/) - [twitter](https://twitter.com/w0tters) - jackwattersdev@gmail.com

## Acknowledgments

A big thanks to the following services that made this project possible:

- [Upstash](https://upstash.com/)
- [Qstash](https://upstash.com/)
- [Pusher](https://pusher.com/)
- [Shadcn](https://ui.shadcn.com/)
- [Auth.js](https://authjs.dev/)
- [Nodemailer](https://nodemailer.com/)
- [create-t3-app](https://create.t3.gg/)
- [Sentry](https://sentry.io/)
- [Posthog](https://posthog.com/)
- [Vercel](https://vercel.com/)
- [Railway](https://railway.app/)
- [Docker](https://www.docker.com/)
- [Twilio](https://www.twilio.com/)
