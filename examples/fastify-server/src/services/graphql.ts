import {
	createClient,
	createUser,
	deleteUser,
	updateClient,
} from "./resolvers/auth.js";

export const schema = `
  type Client {
    id: ID!
    name: String!
    email: String!
    active: Boolean!
  }

  type UserToken {
    token: String!
  }

  type User {
    id: ID!
    clientId: String!
    username: String!
    email: String!
    active: Boolean!
    password: String!
    tokens: [UserToken]
  }

  type Query {
    dummy: String
  }

  type Mutation {
    createClient(
      name: String!,
      email: String!): Client

    updateClient(
      name: String!,
      allowedOrigins: [String]!): Client

    createUser(
      username: String!,
      email: String!,
      password: String!,
      clientId: String!): User

    deleteUser(
      username: String!,
      password: String!,
      clientId: String!): User
  }
`;

export const resolvers = {
	Mutation: {
		createClient,
		createUser,
		deleteUser,
		updateClient,
	},
};
