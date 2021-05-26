const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
} = graphql;
const _ = require('lodash');
const axios = require('axios');
const { response } = require('express');

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // function gets defined but not executed until entire file is executed. This avoids circular type references.
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    // adding bidirectional flow
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        // parent value is the instance of the company we are currently working with
        return axios
          .get(`http:localhost:3000/companies/${parentValue.id}/users`)
          .then((res) => res.data);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        // pass parentvalue.companyId to company db
        return (
          axios
            .get(`http://localhost:3000/companies/${parentValue.companyId}`)
            // since axios returns everything on data property, we need to grab that before passing data to graphql
            .then((res) => {
              res.data;
            })
        );
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((res) => res.data);
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((res) => res.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
