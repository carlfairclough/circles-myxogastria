import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

const StyledSeedContainer = styled.ol`
  background-color: rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 24px 16px;
`;

const shakeSeed = keyframes`
  5% {
    box-shadow: 0px 0px 0px 1px red;
    background-color: #FDDCFA;
  }

  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }

  100% {
    box-shadow: 0px 0px 0px 1px transparent;
    background-color: #FFF;
  }
`;

const StyledSeedItem = styled.li.attrs((props) => ({
  data: props.index + 1,
}))`
  border-radius: 4px;
  padding: 8px;
  white-space: pre;
  display: inline-block;
  width: calc(33.3% - 9px);
  text-align: left;
  margin-left: 9px;
  margin-bottom: 16px;
  background: #fff;
  white-space: pre;
  position: relative;
  animation: ${shakeSeed};

  &:nth-child(3n + 1) {
    margin-left: 0;
  }

  &:before {
    content: attr(data);
    margin-right: 4px;
    opacity: 0.4;
  }
`;

const StyledSeedItemObfuscated = styled(StyledSeedItem)`
  cursor: ${(props) => (!props.correctClicked || !props.disabled) && 'pointer'};
`;

const StyledSeedItemCorrectClicked = styled(StyledSeedItem)`
  background-color: #dce9fd;
  border: 1px solid pink;

  &:after {
    position: absolute;
    width: 100%;
  }
`;

const StyledNewMagicWords = styled.button`
  border-radius: 4px;
  padding: 8px;
  width: 100%;
`;

const Mnemonic = ({
  text,
  correctClicked,
  correctIndex,
  clickHandler,
  newPhraseHandler,
  attemptsRemaining,
  obfuscate,
}) => {
  // use element key to target shake
  // on incorrect press
  const [clickedIndex, setClickedIndex] = useState(null);

  return (
    <StyledSeedContainer>
      {text.split(' ').map((w, index) => {
        // For when the person is confirming their seed phrase,
        // we must check whether the correct item has been clicked
        // AND whether this is the correct item
        const isThisCorrectIndex = index === correctIndex;
        const isThisCorrectClicked = isThisCorrectIndex && correctClicked;
        const isThisDisabled = attemptsRemaining <= 0;

        // Word needs a space to allow for proper copying + pasting
        let word = w + ' ';

        // Create the props object
        // Clickhandler only matters when obfuscated, and when limit not hit!
        const seedItemProps = {
          correctClicked: correctClicked,
          clickedIndex: clickedIndex,
          index: index,
          key: index,
          obfuscate: obfuscate,
        };

        obfuscate &&
          !correctClicked &&
          !isThisDisabled &&
          (seedItemProps.onClick = () => {
            clickHandler(index);
            setClickedIndex(index);
          });

        // if incorrect clicked
        // const shakeItem = (index, correctIndex) => {
        //   console.log('wibble wobble');
        //   seedItemProps.shake = setShake(index);
        // };
        // seedItemProps.shake = true;

        return isThisCorrectClicked ? (
          <StyledSeedItemCorrectClicked {...seedItemProps}>
            {word}
          </StyledSeedItemCorrectClicked>
        ) : obfuscate ? (
          <StyledSeedItemObfuscated
            {...seedItemProps}
            disabled={isThisDisabled}
          />
        ) : (
          !obfuscate && (
            <StyledSeedItem {...seedItemProps}>{word}</StyledSeedItem>
          )
        );
      })}
      {obfuscate && !correctClicked && (
        <StyledNewMagicWords
          onClick={() => newPhraseHandler(2)}
        >{`I don't know—I need new magic words`}</StyledNewMagicWords>
      )}
    </StyledSeedContainer>
  );
};

Mnemonic.propTypes = {
  attemptsRemaining: PropTypes.number,
  clickHandler: PropTypes.func,
  // clickedIndex: PropTypes.number,
  correctClicked: PropTypes.bool,
  correctIndex: PropTypes.number,
  newPhraseHandler: PropTypes.func,
  obfuscate: PropTypes.bool,
  text: PropTypes.string.isRequired,
};

StyledSeedItem.propTypes = {
  clickedIndex: PropTypes.number,
  correctClicked: PropTypes.bool,
  // data: PropTypes.number.isRequired,
  obfuscate: PropTypes.bool,
};

export default Mnemonic;
