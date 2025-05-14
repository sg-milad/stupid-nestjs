# ![nestjs32x32](https://github.com/imanhpr/nest-assignment/assets/56130647/facef099-7c17-4d9c-ae36-84265b05e31a) stupid-crud-customer


Create a simple CRUD application with [NestJS](https://nestjs.com/) that implements the below model:
```
Customer {
	FirstName
	LastName
	DateOfBirth
	PhoneNumber
	Email
	BankAccountNumber
}
```


## Practices and patterns:

- [TDD](https://en.wikipedia.org/wiki/Test-driven_development)
- [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development)
- [DDD](https://en.wikipedia.org/wiki/Domain-driven_design)
- [Clean architecture](https://dev.to/dipakahirav/modern-api-development-with-nodejs-express-and-typescript-using-clean-architecture-1m77)
- [CQRS](https://en.wikipedia.org/wiki/Command%E2%80%93query_separation#Command_query_responsibility_separation) pattern ([Event sourcing](https://en.wikipedia.org/wiki/Domain-driven_design#Event_sourcing)).
- Clean git commits that show your work progress, each commit must provide your decision-making process for each change or selection.

please copy and past these commands

```
~ cp .env.example .env
~ docker compose up
```

## Documentation

after build please open [localhost](http://localhost:3000/api).

## tests

```
~ pnpm test
```
