import {Component} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import {findDOMNode} from 'react-dom';
import invariant from 'invariant'; 

import {provideDisplayName} from './utils';
 
// Export Higher Order Sortable Element Component
export default function SortableHandle(WrappedComponent, config = {withRef: false}) {
  return class extends Component {
    static displayName = provideDisplayName('sortableHandle', WrappedComponent);

    componentDidMount() {
      const node : any = findDOMNode(this);
      node.sortableHandle = true;
    }

    getWrappedInstance() {
      invariant(
        config.withRef,
        'To access the wrapped instance, you need to pass in {withRef: true} as the second argument of the SortableHandle() call'
      );
      return this.refs.wrappedInstance;
    }

    render() {
      const ref = config.withRef ? 'wrappedInstance' : null;
 
      return <WrappedComponent ref={ref} {...this.props} />;
    }
  }; 
}
