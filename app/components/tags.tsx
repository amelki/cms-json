import * as React from 'react';
import { WithOutContext as ReactTags } from 'react-tag-input';

export default class Tags extends React.Component<any, any> {
    constructor(props) {
        super(props);
        let tags = props.value ? props.value : [];
        this.state = { tags: [] };
        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            this.state.tags.push({ id: tag, text: tag });
        }
        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.notifyChange = this.notifyChange.bind(this);
    }

    notifyChange() {
        let tags = this.state.tags;
        let array: string[] = [];
        for (let j = 0; j < tags.length; j++) {
            let t = tags[j];
            array.push(t.text);
        }
        this.props.onChange(array);
    }

    handleDelete(i) {
        let tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags});
        this.notifyChange();
    }

    handleAddition(tag) {
        this.setState(state => ({ tags: [...state.tags, tag] }));
        this.notifyChange();
    }

    handleDrag(tag, currPos, newPos) {
        const tags = [...this.state.tags];
        const newTags = tags.slice();

        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);

        this.setState({ tags: newTags });
        this.notifyChange();
    }

    render() {
        const { tags } = this.state;
        return (
            <div>
                <ReactTags tags={tags}
                                     suggestions={[]}
                                     handleDelete={this.handleDelete}
                                     handleAddition={this.handleAddition}
                                     handleDrag={this.handleDrag} />
            </div>
        )
    }
};
