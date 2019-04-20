import React, { Component } from 'react'
import withStyles from "@material-ui/core/styles/withStyles";
import homeStyle from '../../assets/jss/homeStyle';
import Dropzone from "react-dropzone";
import { Grid } from '@material-ui/core';
class Home extends Component {
  constructor(props){
    super(props)
    this.state={
      file:"",
      imgUrl:"",
      ready:false
    }
  }


  handleChange = files => {
    var fileTypes = ["jpg", "jpeg", "png"];
    console.log(files);
    
    let reader = new FileReader();
    let file = files[0];
    var fileType = file.name
      .split(".")
      .pop()
      .toLowerCase();
    if (fileTypes.includes(fileType)) {
      // input is image file
      reader.onloadend = () => {
        this.setState({ file: file, imgUrl: reader.result, ready: true });
      };
      reader.readAsDataURL(file);
    } else {
      //input wrong
    }
  };

  render() {
    const { classes } = this.props
    const {imgUrl } =this.state
    return (
      <div>
        <p>Home Screen</p>
        <Dropzone
          onDrop={acceptedFiles => this.handleChange(acceptedFiles)}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <Grid container  {...getRootProps()} className={classes.dropZone}>
                  <input {...getInputProps()} />
                  <p>
                    Drag 'n' drop some files here, or click to select files
                  </p>
              </Grid>
            </section>
          )}
        </Dropzone>
        <img src={imgUrl} className={classes.image} alt="preview" />
      </div>
    );
  }
}

export default withStyles(homeStyle)(Home);