import { Button } from 'semantic-ui-react';
import styled, { keyframes } from 'styled-components';

const BackToDocs = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(0.35em);
  }
  100% {
    transform: translateY(0);
  }
`;

export default styled(Button)`
  &&& {
    margin-top: 8px;
    margin-bottom: 32px;
    animation-name: ${BackToDocs};
    animation-duration: 1.5s;
    animation-timing-function: ease-in-out;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-direction: normal;
    animation-fill-mode: none;
    animation-play-state: running;
  }
`;
