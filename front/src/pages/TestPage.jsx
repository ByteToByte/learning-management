import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getAllTests, getSelectedTests } from '../redux/Tests/actions';

import { Button, Header, Modal, Form } from 'semantic-ui-react';


class TestPage extends Component {
  state = {
    changeData: true,
  };

  async componentDidMount() {
    // await this.getTests();
    await this.props.getSelectedTests(this.props.selectedGroup);
    const test = this.props.tests.find(e => e.googleFormsLink === this.props.match.params.id);
    await this.setState({ test: test });
  }

  func = async () => {
    let data = {
      title: this.state.title,
      googleFormsLink: this.state.googleFormsLink,
      id: this.props.match.params.id,
    };
    let resp = await fetch('/edittest', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    let dataresp = await resp.json();
    this.setState({ modalOpen: false, changeData: false });
    this.setState({ changeData: false });
    // this.setState({buttonClicked:'sdasd'});
  };

  get = async e => {
    e.preventDefault();
    this.setState({ changeData: true })
    this.func();
  };

  async componentDidUpdate(prevProps, prevState) {
    // if (prevState.modalOpen && !this.state.modalOpen) {
    if (prevState.changeData && !this.state.changeData) {
      console.log("STATE CHANGED");

      await this.func();
      await this.props.getSelectedTests(this.props.selectedGroup);
      const test = this.props.tests.find(el => el.googleFormsLink === this.props.match.params.id);
      this.setState({
        title: test.title,
        googleFormsLink: test.googleFormsLink,
      });
      
      this.setState({ test: test });
      // this.setState({changeData:true})
      this.props.history.push('/tests');
    }
  }

  title = e => {
    this.setState({ title: e.target.value });
  };

  googleFormsLink = e => {
    this.setState({ googleFormsLink: e.target.value });
  };

  handleOpen = e => {
    this.setState({ modalOpen: true });
  };
  handleClose = e => {
    this.setState({ modalOpen: false });
    // this.setState({closedStatus:true})
  };

  render() {
    return (
      <>
        {this.props.admin === 'admin' ? (
          <>
            <Modal
              trigger={
                <Button positive onClick={this.handleOpen}>
                  Изменить тест
                </Button>
              }
              closeIcon
              open={this.state.modalOpen}
              // close={this.state.modalOpen}
              onClose={this.handleClose}
            // basic
            >
              <Modal.Header>{this.state.topicName}</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  {/* <Header className="regForm">
                    Фаза:{this.state.topicPhase} Неделя:{this.state.topicWeek} День:{this.state.topicDay}
                  </Header> */}
                  {/* ФОрма */}
                  <Modal.Actions>
                    <Form className="regForm">
                      <Form.Field>
                        <label htmlFor="title">Title</label>
                        <input type="text" name="title" required onChange={this.title} />
                      </Form.Field>
                      <Form.Field>
                        <label htmlFor="googleFormsLink">Google Form Link</label>
                        <input type="text" name="googleFormsLink" onChange={this.googleFormsLink} />
                      </Form.Field>
                      {/* <Form.Field>
                        <label htmlFor="githubLink">githubLink</label>
                        <input type="text" name="githubLink" onChange={this.githubLink} />
                      </Form.Field> */}
                    
                      <div className="form-field">
                        <Button type="button" className="Button" onClick={this.get}>
                          Отправить
                        </Button>{' '}
                      </div>
                    </Form>
                  </Modal.Actions>
                  {/* форма */}
                </Modal.Description>
              </Modal.Content>
            </Modal>
          </>
        ) : (
            <></>
          )}

        {this.state.test ? (
          <iframe
            title="Test"
            className="testFrame"
            src={`https://docs.google.com/forms/d/e/${this.state.test.googleFormsLink}/viewform?embedded=true`}
            width="700"
            height="800"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >
            Загрузка...
          </iframe>
        ) : (
            <></>
          )}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    tests: state.Test.tests,
    user: state.User.user,
    admin: state.User.user.adminstatus,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getTests: () => dispatch(getAllTests()),
    getSelectedTests: selectedGroup => dispatch(getSelectedTests(selectedGroup)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TestPage);
