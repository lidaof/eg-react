import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ActionCreators } from "../AppState";
import { treeOfLife } from "../model/genomes/allGenomes";
// import CurvedMenu from "curved-menu";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import SearchIcon from '@material-ui/icons/Search';

import "./GenomePicker.css";
import {
    CardMedia,
    Container,
    ListItem,
    ListItemText,
    ListItemIcon,
    List,
    AppBar,
    Toolbar,
    TextField,
    ButtonBase as BaseButtonBase,
    makeStyles,
    withStyles,
    InputAdornment,
} from "@material-ui/core";

const callbacks = { onGenomeSelected: ActionCreators.setGenome };

const ButtonBase = withStyles({
    root: {
        margin: "10px",
    }
})(BaseButtonBase);

class GenomePicker extends React.PureComponent {
    static propTypes = {
        onGenomeSelected: PropTypes.func, // Called on genome selection.  Sigature: (genomeName: string): void
    };

    constructor() {
        super();
        this.state = {
            species: "",
            assembly: "",
            searchText: ""
        };
        this.renderGenomeOption = this.renderGenomeOption.bind(this);
        this.chooseSpecies = this.chooseSpecies.bind(this);
        this.chooseAssembly = this.chooseAssembly.bind(this);
        // this.menuRef = React.createRef();
    }

    renderGenomeOption(config, index) {
        const genomeName = config.genome.getName();
        return (
            <button key={index} onClick={() => this.props.onGenomeSelected(genomeName)}>
                {genomeName}
            </button>
        );
    }

    chooseSpecies(event) {
        this.setState({ species: event.currentTarget.value, assembly: "" });
    }

    chooseAssembly(event) {
        this.setState({ assembly: event.currentTarget.value });
    }

    renderTree() {
        let divList = [];
        for (const [species, details] of Object.entries(treeOfLife)) {
            divList.push(
                <div className="GenomePicker-one-species" key={species}>
                    <label htmlFor={species}>
                        <input
                            type="radio"
                            id={species}
                            value={species}
                            checked={this.state.species === species}
                            onChange={this.chooseSpecies}
                        />
                        <div className="capitalize">{species}</div>
                        <div>
                            <img className="GenomePicker-img" src={details.logoUrl} alt={species} />
                        </div>
                    </label>
                </div>
            );
        }
        return divList;
    }

    // Map the genomes to a list of cards. Genome search engine filters by both the species and the different assemblies.
    // It is not case sensitive.
    renderTreeCards() {
        const { searchText } = this.state;
        return Object.entries(treeOfLife)
            .filter(([species, details]) => {
                return species.toLowerCase().includes(searchText.toLowerCase()) ||
                    details.assemblies.join('').toLowerCase().includes(searchText);
            }).map(([species, details]) => {
                let filteredAssemblies = details.assemblies;
                if (!species.toLowerCase().includes(searchText.toLowerCase())) {
                    filteredAssemblies = details.assemblies.filter(e => e.toLowerCase().includes(searchText.toLowerCase()));
                }
                return <Grid item xs={12} md={4} align="center">
                    <GenomePickerCard
                        species={species}
                        details={{ logoUrl: details.logoUrl, assemblies: filteredAssemblies }}
                        onChoose={(genomeName) => this.props.onGenomeSelected(genomeName)}
                    />
                </Grid>
            });
    }

    // renderAssembly() {
    //     let divList = [];
    //     const assemblies = treeOfLife[this.state.species].assemblies;
    //     for (const assembly of assemblies) {
    //         divList.push(
    //             <label htmlFor={assembly} key={assembly}>
    //                 <input
    //                     type="radio"
    //                     id={assembly}
    //                     value={assembly}
    //                     checked={this.state.assembly === assembly}
    //                     onChange={this.chooseAssembly}
    //                 />
    //                 {assembly}
    //             </label>
    //         );
    //     }
    //     return divList;
    // }

    render() {
        return (
            <>
                <AppHeader />
                <Container maxWidth="md">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" style={{ margin: "25px", marginLeft: 0 }}>Please select a genome</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                id="outlined-margin-normal"
                                placeholder="Search for a genome..."
                                margin="normal"
                                variant="outlined"
                                style={{ width: "100%", paddingRight: "16px" }}
                                className="searchFieldRounded"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={e => this.setState({ searchText: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={4}>
                        {this.renderTreeCards()}
                    </Grid>
                </Container>
            </>
        )

        // return (
        //     <div className="GenomePicker-outer">
        //         <div className="GenomePicker-nav">
        //             <img
        //                 src="https://epigenomegateway.wustl.edu/browser/favicon-144.png"
        //                 style={{ width: "auto", height: "40px" }}
        //                 alt="browser logo"
        //             />
        //             <ul className="nav justify-content-end">
        //                 <li className="nav-item">
        //                     <a
        //                         className="nav-link"
        //                         href="https://epigenomegateway.readthedocs.io/"
        //                         target="_blank"
        //                         rel="noopener noreferrer"
        //                     >
        //                         Documentation
        //                     </a>
        //                 </li>
        //                 <li className="nav-item">
        //                     <a
        //                         className="nav-link"
        //                         href="http://epigenomegateway.wustl.edu/legacy/"
        //                         target="_blank"
        //                         rel="noopener noreferrer"
        //                     >
        //                         The 'old' browser
        //                     </a>
        //                 </li>
        //             </ul>
        //         </div>
        //         <hr style={{ marginTop: 0 }} />
        //         <Typography variant="h4">Please select a genome</Typography>
        //         <div className="GenomePicker-main">
        //             {/* <div ref={this.menuRef}></div> */}
        //             <div className="GenomePicker-species">{this.renderTree()}</div>
        //             <div className="GenomePicker-select">
        //                 <div className="GenomePicker-assembly">{this.state.species && this.renderAssembly()}</div>
        //                 <div className="GenomePicker-go">
        //                     {this.state.assembly && (
        //                         <button
        //                             className="btn btn-primary btn-lg btn-block"
        //                             onClick={() => this.props.onGenomeSelected(this.state.assembly)}
        //                         >
        //                             Go ⇒
        //                         </button>
        //                     )}
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // );
    }
}

function AppHeader() {
    const styles = useStyles();

    return (
        <div>
            <AppBar color="transparent" position="static">
                <Toolbar disableGutters>
                    <img src="https://epigenomegateway.wustl.edu/browser/favicon-144.png" alt="Browser Icon" style={{ height: 50, width: "auto", marginLeft: 20, marginRight: 20 }} />
                    <Typography variant="h5" noWrap>
                        WashU <span style={{ fontWeight: 100, }}>Epigenome Browser</span>
                    </Typography>
                    <div className={styles.alignRight}>
                        <ButtonBase onClick={() => window.open('https://epigenomegateway.readthedocs.io/en/latest/')}>
                            <Typography
                                variant="subtitle1"
                            >
                                Documentation
                            </Typography>
                        </ButtonBase>
                        <ButtonBase onClick={() => window.open('http://epigenomegateway.wustl.edu/legacy/')}>
                            <Typography
                                variant="subtitle1"
                                color="primary"
                            >
                                Switch to the 'old' browser
                            </Typography>
                        </ButtonBase>
                    </div>
                </Toolbar>
            </AppBar>
        </div >
    )
}

function GenomePickerCard(props) {
    const styles = useStyles();
    const { species, details, onChoose } = props;
    const { logoUrl, assemblies } = details;

    const renderAssemblies = () => {
        return assemblies.map((assembly) => {
            return (
                <ListItem button onClick={() => onChoose(assembly)} style={{ height: 25 }}>
                    <ListItemIcon>
                        <ChevronRightIcon />
                    </ListItemIcon>
                    <ListItemText primary={assembly} />
                </ListItem>
            );
        })
    }

    return (
        <Card className={styles.card}>
            <CardMedia
                image={logoUrl}
                title={species}
                className={styles.media}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2" className={styles.cardTitle}>
                    {species}
                </Typography>
                <List className={styles.vertScroll}>
                    {renderAssemblies()}
                </List>
            </CardContent>
        </Card>
    );
}

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
    media: {
        height: 80,
        borderRadius: "30px"
    },
    cardTitle: {
        textTransform: 'capitalize',
        textAlign: "left"
    },
    card: {
        borderRadius: '30px',
        height: "100%",
        width: "270px",
    },
    alignRight: {
        marginRight: 15,
        marginLeft: "auto",
    },
});

export default connect(null, callbacks)(GenomePicker);
