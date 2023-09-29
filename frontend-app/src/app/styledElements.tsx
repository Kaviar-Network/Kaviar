import { styled } from "@mui/system";
import {
    Select,
    Accordion,
    Typography,
    Button,
    Box,
    Paper,
} from "@mui/material";
import PropTypes from "prop-types";

export const StyledSelect = styled(Select)({
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "white",
        },
        "&:hover fieldset": {
            borderColor: "white",
        },
        "&.Mui-focused fieldset": {
            borderColor: "white",
        },
    },
    "& .MuiInputBase-input": {
        color: "white",
    },
    "& .MuiFormLabel-root": {
        color: "white",
    },
    "& .MuiInputLabel-root": {
        color: "white",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "white",
    },
    "& .MuiSvgIcon-root": {
        color: "white",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "white",
    },
});

export const StyledPinkPaper = styled(Paper)(({ theme }) => ({
    margin: "1em",
    padding: theme.spacing(2),
    color: "white",
    background: "#ef7f91",
    border: 0,
    borderRadius: 3,
    textAlign: "center",
}));

export const StyledPurplePaper = styled(Paper)(({ theme }) => ({
    margin: "1em",
    padding: theme.spacing(2),
    color: "white",
    background: "#7826eb",
    border: 0,
    borderRadius: 3,
    textAlign: "center",
}));

export const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

export const StyledButton = styled(Button)({
    height: "70px",
    "& .MuiButton-label": {
        fontSize: "1.5rem", // Increase the font size
    },
});

export const StyledPinkButton = styled(Button)({
    height: "70px",
    backgroundColor: "#ef7f91", // Set the background color to pink
    "&:hover": {
        backgroundColor: "#ef7f91", // Adjust the hover color if needed
    },
    "& .MuiButton-label": {
        fontSize: "1.5rem", // Increase the font size
    },
});

export const CustomAccordion = styled(Accordion)({
    color: "rgba(236,236,241,1)",
    background: "#843de7",
});

export function CustomTabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};
