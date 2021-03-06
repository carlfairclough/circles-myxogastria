import PropTypes from 'prop-types';
import React from 'react';
import clsx from 'clsx';
import { Button as MuiButton } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  button: {
    fontWeight: theme.typography.fontWeightRegular,
    textTransform: 'none',
    borderRadius: 16,
  },
  buttonDark: {
    color: theme.palette.text.primary,
  },
  buttonOutline: {
    height: 36.5, // Make it as high as the other buttons
    color: theme.palette.primary.main,
    border: `${theme.palette.primary.main} 2px solid`,
    '&.Mui-disabled': {
      borderColor: theme.palette.action.disabled,
    },
  },
  buttonDanger: {
    background: theme.custom.colors.red,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.custom.colors.red,
    },
  },
  buttonPrimary: {
    background: theme.custom.gradients.purple,
    color: theme.palette.common.white,
    '&.Mui-disabled': {
      background: theme.custom.gradients.gray,
    },
  },
}));

// eslint-disable-next-line react/display-name
const Button = React.forwardRef(
  (
    {
      children,
      className: classNameExternal,
      isDanger,
      isDark,
      isOutline,
      isPrimary,
      to,
      ...props
    },
    ref,
  ) => {
    const classes = useStyles();

    const className = clsx(classes.button, classNameExternal, {
      [classes.buttonDanger]: isDanger,
      [classes.buttonDark]: isDark,
      [classes.buttonOutline]: isOutline,
      [classes.buttonPrimary]: isPrimary,
    });

    return React.createElement(
      MuiButton,
      {
        className,
        ref,
        ...(to
          ? {
              to,
              component: Link,
            }
          : {}),
        ...props,
      },
      children,
    );
  },
);

Button.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  isDanger: PropTypes.bool,
  isDark: PropTypes.bool,
  isOutline: PropTypes.bool,
  isPrimary: PropTypes.bool,
  onClick: PropTypes.func,
  to: PropTypes.string,
};

export default Button;
