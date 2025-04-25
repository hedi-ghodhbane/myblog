---
title: "Attendance tracker"
summary: "Admin panel, Mobile app for players attendance tracking."
date: "Oct 01 2024"
draft: false
tags:
- React
- NestJS
- Postgres
- TypeORM
- Docker
---

This is confidential project, let's call it attendance tracker. It is live and used by a sport team.

## The idea

The project is meant to track players attendance in trainings and tournaments. Coach will install a Flutter application on his ios/android device, login, app will check his location to make sure he's in the Club and then he can save a timesheet for his players. 

The big part is the Admin. It's a system to create players/coaches/groups/tournaments.

The admin was built using React admin, which provides an easy way to use data-tables, forms, filters and much more. 

## Complex features

- Location based login. 
- Crons for each tournament, to make access available even outside the club for certain coaches
- Intuitive admin interface with pagination/filtering/secure role based access.
