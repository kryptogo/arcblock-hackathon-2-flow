import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Vizceral from 'vizceral-react';

import { dataSources, getClient } from '../../libs/ocap';

import Layout from '../../components/Layout';

import './style.css';

const baseGraph = {
  "renderer": "global",
  "name": "base",
  "nodes": [
    {
      "renderer": "region",
      "name": "Top 10",
      "maxVolume": 50000,
      "class": "normal",
      "nodes": [],
      "connections": []
    }
  ],
  "connections": []
}

class FlowDemo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: dataSources[0],
      message: null,
      timestamp: null,
      loading: false,
      currentView: ["Top 10"],
      redirectedFrom: undefined,
      selectedChart: undefined,
      displayOptions: {
        allowDraggingOfNodes: true,
        showLabels: true
      },
      currentGraph_physicsOptions: {
        isEnabled: true,
        viscousDragCoefficient: 0.2,
        hooksSprings: {
          restLength: 50,
          springConstant: 0.2,
          dampingConstant: 0.1
        },
        particles: {
          mass: 1
        }
      },
      labelDimensions: {},
      appliedFilters: null,
      filters: null,
      searchTerm: '',
      matches: {
        total: -1,
        visible: -1
      },
      trafficData: {
        nodes: [],
        connections: []
      },
      regionUpdateStatus: [],
      timeOffset: 0,
      modes: {
        detailedNode: 'volume'
      }
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });

    const client = getClient(this.state.dataSource.name);

    const data = await client.doRawQuery(`{
      richestAccounts {
        data {
          address
          balance
          txsSent {
            data{
              hash
              total
              fees
              outputs {
                data {
                  account
                  value
                }
              }
            }
          }
        }
      }
    }`);

    this.updateData(baseGraph, data.richestAccounts.data);
  }

  updateData (base, data) {
    const richestNode = base.nodes[0];
    const connections = [];
    const nodes = [];

    data.forEach(account => {
      account.txsSent.data.forEach(tran => {
        tran.outputs.data.forEach(out => {
          const target = out.account;
          nodes.push({
            class: "normal",
            name: out.account,
            renderer: "focusedChild",
            size: 120
          });
          connections.push({
            class: "normal",
            metrics: {
              normal: Math.log2(tran.total),
            },
            source: account.address,
            target
          });
        });
      });

      nodes.push({
        class: "normal",
        name: account.address,
        renderer: "focusedChild",
        size: 120
      });
    });

    richestNode.nodes = nodes;
    richestNode.connections = connections;

    this.setState({
      loading: false,
      trafficData: {...base}
    });
  }

  objectHighlighted = async (highlightedObject) => {
    const id = highlightedObject && highlightedObject.name;

    if (id !== this.id) {
      this.id = id;
      const client = getClient(this.state.dataSource.name);
      const data = await client.doRawQuery(`{
        accountByAddress(address: "${id}"){
          address
          balance
          numberTxsReceived
          numberTxsSent
          txsSent {
          	data {
              hash
              total
              fees
              outputs {
                data {
                  account
                  value
                }
              }
          	}
        	}
        }
      }`);

      if (data.accountByAddress && data.accountByAddress.txsSent && data.accountByAddress.txsSent.data.length > 0) {
        this.updateData(baseGraph, [data.accountByAddress]);
      } else {
        alert('Nothing sent!');
      }

      this.setState({
        highlightedData: data.accountByAddress
      });
    }
  }

  render() {
    const { highlightedData } = this.state;

    return (
      <Layout>
        {!!highlightedData && !!highlightedData.balance && <div>
          Account: {highlightedData && highlightedData.address}<br/>
          Balance: {highlightedData && highlightedData.balance}<br/>
          Transactions Sent: {highlightedData && highlightedData.numberTxsSent}<br/>
          Transactions Recieved: {highlightedData && highlightedData.numberTxsReceived}<br/>
        </div>}
        <Vizceral
          traffic={this.state.trafficData}
          view={this.state.currentView}
          showLabels={this.state.displayOptions.showLabels}
          filters={this.state.filters}
          viewChanged={this.viewChanged}
          viewUpdated={this.viewUpdated}
          objectHighlighted={this.objectHighlighted}
          nodeContextSizeChanged={this.nodeContextSizeChanged}
          objectToHighlight={this.state.objectToHighlight}
          matchesFound={this.matchesFound}
          match={this.state.searchTerm}
          modes={this.state.modes}
          allowDraggingOfNodes={this.state.displayOptions.allowDraggingOfNodes}
        />
      </Layout>
    );
  }
}

export default withRouter(FlowDemo);
