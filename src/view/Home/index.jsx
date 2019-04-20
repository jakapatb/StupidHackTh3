import React, { Component } from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import homeStyle from "../../assets/jss/homeStyle";
import Dropzone from "react-dropzone";
import { Grid } from "@material-ui/core";
import styled, { ThemeProvider } from "styled-components";
import { createMuiTheme } from "@material-ui/core/styles";
import { palette, spacing, typography } from "@material-ui/system";
import Typography from "@material-ui/core/Typography";
import { posix } from "path";
import ModalSection from "./Sections/ModalSection";
import ButtonBase from "@material-ui/core/ButtonBase";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: "",
      imgUrl: "",
      ready: false,
      display: false
    };
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
        this.setState({
          file: file,
          imgUrl: reader.result,
          display: true
        });
      };
      reader.readAsDataURL(file);
    } else {
      //input wrong
    }
  };

  render() {
    const Box = styled.div`${palette}${spacing}${typography}`;
    const theme = createMuiTheme({
      typography: {
        useNextVariants: true
      }
    });
    const inner = (
      <Box
        bgcolor="background.paper"
        m={1}
        border={1}
        style={{ width: "5rem", height: "5rem" }}
      />
    );
    const { classes } = this.props;
    const { imgUrl } = this.state;

    const fontdrag = {
      flex: 1,
      color: "Black",
      fontSize: "40px",
      justifyContent: "center",
      alignItems: "center"
    };

    return (
      <Grid container direction="row" justify="center" alignItems="center">
        <div>
          <ThemeProvider theme={theme}>
            <Box
              color="primary.main"
              // bgcolor="background.paper"
              fontFamily="h1.fontFamily"
              fontSize={{
                xs: "h6.fontSize",
                sm: "h4.fontSize",
                md: "h3.fontSize"
              }}
              p={{ xs: 2, sm: 3, md: 4 }}
            >
              <h1>DIG LOTTO</h1>
            </Box>
          </ThemeProvider>

          <Dropzone onDrop={acceptedFiles => this.handleChange(acceptedFiles)}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <Grid
                  container
                  {...getRootProps()}
                  className={classes.dropZone}
                >
                  <input {...getInputProps()} />
                  {this.state.display ? (
                    <img src={imgUrl} className={classes.image} alt="preview" />
                  ) : (
                    <p style={fontdrag}>Drop Here</p>
                  )}
                </Grid>
              </section>
            )}
          </Dropzone>
        </div>

        <ButtonBase
          focusRipple
          key={"sfas"}
          onClick={() => console.log("tsd")}
          className={classes.image}
          focusVisibleClassName={classes.focusVisible}
          style={{
            marginTop:"1rem",
            width: "70%"
          }}
        >
          <span
            className={classes.imageSrc}
            style={{
              backgroundImage: `url(${imgUrl})`
            }}
          />
          <span className={classes.imageBackdrop} />
          <span className={classes.imageButton}>
            <Typography
              component="span"
              variant="subtitle1"
              color="inherit"
              className={classes.imageTitle}
            >
              {"Test"}
              <span className={classes.imageMarked} />
            </Typography>
          </span>
        </ButtonBase>
        <ModalSection />
      </Grid>
    );
  }
}

export default withStyles(homeStyle)(Home);
