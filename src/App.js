import React, { Component } from "react";
import CRUDTable,
{
  Fields,
  Field,
  CreateForm,
  UpdateForm,
  DeleteForm,
} from 'react-crud-table';

import './index.css';
require('dotenv').config();

const PriceRenderer = ({ field }) => <textarea {...field} />;

let tasks = [
    /* {
      id: 1,
      product: 'Coffee1',
      price: '10',
    } */
  ];

  const SORTERS = {
    NUMBER_ASCENDING: mapper => (a, b) => mapper(a) - mapper(b),
    NUMBER_DESCENDING: mapper => (a, b) => mapper(b) - mapper(a),
    STRING_ASCENDING: mapper => (a, b) => mapper(a).localeCompare(mapper(b)),
    STRING_DESCENDING: mapper => (a, b) => mapper(b).localeCompare(mapper(a)),
  };

class Home extends Component {

  getSorter = (data) => {
    const mapper = x => x[data.field];
    let sorter = SORTERS.STRING_ASCENDING(mapper);
   
    if (data.field === 'id') {
      sorter = data.direction === 'ascending' ?
        SORTERS.NUMBER_ASCENDING(mapper) : SORTERS.NUMBER_DESCENDING(mapper);
    } else {
      sorter = data.direction === 'ascending' ?
        SORTERS.STRING_ASCENDING(mapper) : SORTERS.STRING_DESCENDING(mapper);
    }
   
    return sorter;
  };

  async fetchItems (payload){
    tasks = [];
    console.log(process.env.REACT_APP_AWS_API_GETALL);
    await fetch(process.env.REACT_APP_AWS_API_GETALL , {method: 'GET'})
    .then(res => res.json())
    .then((data) => 
    {
      for(var i = 0; i < data.length; i++)
      {
        tasks.push({
          id: data[i].idcatalogue,
          product: data[i].name,
          price: data[i].price.toString()
        });
      }
    })
    .catch(console.log);
    
    let result = Array.from(tasks);
    result = result.sort(this.getSorter(payload.sort));
    return Promise.resolve(result);
  }

  async create(task) {
    await fetch(process.env.REACT_APP_AWS_API_INSERT +task.product+"/"+task.price, {method: 'PUT'})
    .catch(console.log);  
    return Promise.resolve(task);
  }

  async update(data) {
    const task = tasks.find(t => t.id === data.id);
    await fetch(process.env.REACT_APP_AWS_API_UPDATE  +data.id+"/" +data.product+"/"+data.price, {method: 'POST'})
    .catch(console.log);  

    return Promise.resolve(task);
  }

  async delete(data) {
    const task = tasks.find(t => t.id === data.id);
    await fetch(process.env.REACT_APP_AWS_API_DELETE +data.id, {method: 'DELETE'})
    .catch(console.log); 

    return Promise.resolve(task);
  }

  styles = {
      container: { margin: 'auto', width: 'fit-content' },
    };

    render() {
        return (
            <div style={this.styles.container}>
      <CRUDTable
        caption="Products"
        fetchItems={payload => this.fetchItems(payload)}
      >
        <Fields>
          <Field
            name="id"
            label="Id"
            hideInCreateForm
          />
          <Field
            name="product"
            label="Product"
            placeholder="Product"
          />
          <Field
            name="price"
            label="Price (DTK)"
            render={PriceRenderer}
          />
        </Fields>
        <CreateForm
          title="Product Creation"
          message="Create a new product!"
          trigger="Create Product"
          onSubmit={task => this.create(task)}
          submitText="Create"
          validate={(values) => {
            const errors = {};
            if (!values.product) {
              errors.title = 'Please, provide product\'s title';
            }
   
            if (!values.price) {
              errors.description = 'Please, provide product\'s price';
            }
   
            return errors;
          }}
        />
   
        <UpdateForm
          title="Product Update Process"
          message="Update product"
          trigger="Update"
          onSubmit={task => this.update(task)}
          submitText="Update"
          validate={(values) => {
            const errors = {};
   
            if (!values.product) {
              errors.title = 'Please, provide product\'s title';
            }
   
            if (!values.price) {
              errors.description = 'Please, provide product\'s price';
            }
   
            return errors;
          }}
        />
   
        <DeleteForm
          title="Product Delete Process"
          message="Are you sure you want to delete the product?"
          trigger="Delete"
          onSubmit={task => this.delete(task)}
          submitText="Delete"
          validate={(values) => {
            const errors = {};
            if (!values.id) {
              errors.id = 'Please, provide id';
            }
            return errors;
          }}
        />
      </CRUDTable>
    </div>
        );
    }
}


export default Home;