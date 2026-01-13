# Minder

## Introduction
A data-verification flowchart application

## Features
FT
- [x] render terminator shape 
- [x] render process shape 
- [x] render data shape
- [x] render decision shape
- [x] drag shapes
- [x] resize shapes
- [x] remove shapes
- [x] connect shapes by curves
- [x] import data in each data shape
- [x] define data usage
- [x] verify data
- [x] suspend data delivery
- [x] infinite whiteboard
- [x] zoom in / out
- [x] validate required fields
- [x] verify repeated data name
- [x] register
- [x] login
- [x] logout
- [x] view project list
- [x] create project
- [x] delete project
- [x] auto calculate curve position
- [x] align shapes
- [x] undo
- [] one-click remove redundancies
- [] modulize steps
- [] data remark
- [] forget password
- [] third-party sign in
- [] copy
- [] redo
- [] optimizing UI
- [] branding page
- [] payment

BK
- [X] register
- [X] auth token(JWT)
- [X] login
- [X] login by token
- [X] create project


## Tech Stack
- react 18.2.14
- next 14.0.1
- tailwindcss 3.3.0
- typescript 5.2.2
- node.js 20.11.0
- express 4.18.3
- .net core 8
- postgresql 17.4.0

## migration command node
npx sequelize-cli db:migrate

## prerequisite C#
- (in .sln folder) dotnet tool install dotnet-ef --version 8.0.11

## migration command C#
- add
dotnet ef migrations add [migartion file name] --project Infrastructure --startup-project WebAPi
- update
dotnet ef database update --project Infrastructure --startup-project WebAPi
- update / downgrade
dotnet ef database update [target migration file name] --project Infrastructure --startup-project WebAPi
- remove
dotnet ef migrations remove --project Infrastructure --startup-project WebAPi
