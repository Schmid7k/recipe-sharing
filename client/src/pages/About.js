import React, { Fragment } from "react";

//components
import NavigationBar from "../components/NavBar/NavBar";

const About = () => {
  return (
    <Fragment>
      <NavigationBar />
      <div className="container-fluid">
        <div className="container pt-3">
            <h1 className="text-center">About</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc ut sapien vel nisl fermentum malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tempor turpis ac ipsum dictum luctus. In hac habitasse platea dictumst. Nullam ut neque maximus, porttitor metus a, ullamcorper ipsum. Cras a arcu rhoncus, cursus tortor vel, iaculis felis. Duis tristique mauris sapien, ut commodo eros vehicula quis. Vivamus vitae neque a sem efficitur volutpat. Donec suscipit justo vitae tristique consequat. Quisque dapibus massa a pretium porttitor. Morbi non metus vehicula arcu convallis pharetra nec et sapien. Etiam a dapibus ex. Vivamus scelerisque, lorem quis mollis rutrum, dui tellus ultricies nisi, vel efficitur felis sem sed diam. Curabitur mollis lectus quis massa fermentum rhoncus. Vivamus magna purus, viverra quis luctus eget, blandit nec augue.</p>
            <p>Donec vulputate velit et ante interdum elementum. Sed porta feugiat hendrerit. Duis orci nibh, vulputate eget odio nec, dignissim accumsan magna. Duis ac dapibus arcu. Nunc iaculis varius nulla nec congue. Praesent in venenatis nunc, sed lobortis elit. Aenean pharetra, quam ut sollicitudin mattis, nulla neque faucibus dui, quis hendrerit ipsum elit sed enim. In sem mi, lobortis a ornare ut, ullamcorper nec ante. Donec tempor nec orci eget faucibus. Ut dignissim elit ut purus porttitor lacinia. Aenean id eleifend lorem. Vivamus imperdiet libero eget nisl tempus faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tincidunt quam at egestas pellentesque.</p>
            <p>Suspendisse eget consectetur velit. Duis porta sit amet mi ac auctor. Quisque at arcu ullamcorper, porttitor turpis pulvinar, vestibulum nisi. Nullam a finibus justo. Suspendisse finibus leo rutrum, ultrices turpis nec, rutrum sem. Proin luctus elit sit amet elit tincidunt finibus. Integer malesuada semper nibh, ac maximus justo bibendum nec. Nullam eget maximus eros. Sed nec nulla quis mauris porta efficitur quis ut dolor. Nullam at neque lorem. Maecenas felis nisi, aliquam in enim ac, rutrum sagittis dolor.</p>
        </div>
      </div>
    </Fragment>
  );
}

export default About;