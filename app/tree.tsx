import * as React from "react";
import Node from './node';

interface Props {
	node: object;
	selection: object;
}

const Tree: React.SFC<Props> = (props) => (
	<nav>
		<ul><Node node={props.node} selection={props.selection} depth={0}/></ul>
	</nav>
);

export default Tree;

// export default class App extends React.Component<Props, {}> {
//     public render(): React.ReactElement<{}> {
//         return <nav>
//             <ul>
//                 <Node node={this.props.node} selection={this.props.selection} depth={0}/>
//             </ul>
//         </nav>
//     }
// }
