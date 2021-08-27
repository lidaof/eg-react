import {
	AppBar,
	CardMedia,
	Container,
	InputAdornment,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	makeStyles,
	TextField,
	Toolbar,
	withStyles
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { useTheme } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import SearchIcon from '@material-ui/icons/Search';
import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import SwipeableViews from 'react-swipeable-views';
import { ActionCreators } from '../AppState';
import { treeOfLife } from '../model/genomes/allGenomes';
import './GenomePicker.css';
import { SessionUI } from './SessionUI';

/**
 * loading page for choose genome
 * @author Daofeng Li
 * @author Shane Liu
 */

const callbacks = { onGenomeSelected: ActionCreators.setGenome };

const LinkWithMargin = withStyles({
	root: {
		margin: '10px'
	}
})(Link);

interface TabPanelProps {
	index: any;
	value: any;
}

const TabPanel: React.FC<React.PropsWithChildren<TabPanelProps>> = ({ children, value, index, ...other }) => {
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`full-width-tabpanel-${index}`}
			aria-labelledby={`full-width-tab-${index}`}
			style={{ overflow: 'hidden' }}
			{...other}>
			{value === index && <Box>{children}</Box>}
		</div>
	);
};

function a11yProps(index: string | number) {
	return {
		id: `full-width-tab-${index}`,
		'aria-controls': `full-width-tabpanel-${index}`
	};
}

interface GenomePickerProps {
	onGenomeSelected: (name: string) => void; // Called on genome selection.
	bundleId: string;
}

const GenomePicker: React.FC<GenomePickerProps> = (props) => {
	const theme = useTheme();
	const [value, setValue] = React.useState(0);
	const [searchText, setSearchText] = useState('');

	const handleChange = useCallback((event, newValue) => {
		setValue(newValue);
	}, []);

	const handleChangeIndex = useCallback((index) => {
		setValue(index);
	}, []);

	// Map the genomes to a list of cards. Genome search engine filters by both the species and the different assemblies.
	// It is not case sensitive.
	const renderTreeCards = () => {
		return Object.entries(treeOfLife)
			.filter(([species2, details]) => {
				return species2.toLowerCase().includes(searchText.toLowerCase()) || details.assemblies.join('').toLowerCase().includes(searchText);
			})
			.map(([species2, details], idx) => {
				let filteredAssemblies = details.assemblies;
				if (!species2.toLowerCase().includes(searchText.toLowerCase())) {
					filteredAssemblies = details.assemblies.filter((e) => e.toLowerCase().includes(searchText.toLowerCase()));
				}
				return (
					// Removed align="center" because prop doesnt exist?
					<Grid item xs={12} md={4} key={idx}>
						<GenomePickerCard
							species={species2}
							details={{ logoUrl: details.logoUrl, assemblies: filteredAssemblies }}
							onChoose={(genomeName) => props.onGenomeSelected(genomeName)}
						/>
					</Grid>
				);
			});
	};

	return (
		<>
			<AppHeader />
			<AppBar position="static" color="default">
				<Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" variant="fullWidth" aria-label="genome picker">
					<Tab label="Choose a Genome" {...a11yProps(0)} />
					<Tab label="Load a session" {...a11yProps(1)} />
				</Tabs>
			</AppBar>
			<SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={value} onChangeIndex={handleChangeIndex}>
				{/* Removed dir={theme.direction} because doesn't exist */}
				<TabPanel value={value} index={0}>
					<Container maxWidth="md">
						<Grid container spacing={4}>
							<Grid item xs={12} md={6}>
								<Typography variant="h4" style={{ margin: '25px', marginLeft: 0 }}>
									Please select a genome
								</Typography>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									id="outlined-margin-normal"
									placeholder="Search for a genome..."
									margin="normal"
									variant="outlined"
									style={{ width: '100%', paddingRight: '16px' }}
									className="searchFieldRounded"
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon />
											</InputAdornment>
										)
									}}
									onChange={(e) => setSearchText(e.target.value)}
								/>
							</Grid>
						</Grid>
						<Grid container spacing={2}>
							{renderTreeCards()}
						</Grid>
					</Container>
				</TabPanel>
				{/* Removed dir={theme.direction} because doesn't exist */}
				<TabPanel value={value} index={1}>
					{!process.env.REACT_APP_NO_FIREBASE ? (
						<SessionUI bundleId={props.bundleId} withGenomePicker={true} />
					) : (
						<p>Session function is only working with Firebase configuration.</p>
					)}
				</TabPanel>
			</SwipeableViews>
		</>
	);
};

const AppHeader: React.FC = () => {
	const styles = useStyles();
	return (
		<div>
			<AppBar color="transparent" position="static">
				<Toolbar disableGutters>
					<img
						src="https://epigenomegateway.wustl.edu/browser/favicon-144.png"
						alt="Browser Icon"
						style={{ height: 50, width: 'auto', marginLeft: 20, marginRight: 20 }}
					/>
					<Typography variant="h5" noWrap>
						WashU <span style={{ fontWeight: 100 }}>Epigenome Browser</span>
					</Typography>
					<div className={styles.alignRight}>
						<LinkWithMargin href="https://epigenomegateway.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer">
							Documentation
						</LinkWithMargin>
						<LinkWithMargin href="https://epigenomegateway.wustl.edu/legacy/" target="_blank" rel="noopener noreferrer">
							Switch to the 'old' browser
						</LinkWithMargin>
					</div>
				</Toolbar>
			</AppBar>
		</div>
	);
};

interface GenomePickerCardProps {
	species: string;
	details: {
		logoUrl: string;
		assemblies: string[];
	};
	onChoose: (assembly: string) => void;
}

const GenomePickerCard: React.FC<GenomePickerCardProps> = ({ species, details, onChoose }) => {
	const styles = useStyles();
	const { logoUrl, assemblies } = details;

	const renderAssemblies = () => {
		return assemblies.map((assembly, idx) => {
			return (
				<ListItem key={idx} button onClick={() => onChoose(assembly)} style={{ height: 25 }}>
					<ListItemIcon>
						<ChevronRightIcon />
					</ListItemIcon>
					<ListItemText primary={assembly} />
				</ListItem>
			);
		});
	};

	return (
		<Card className={styles.card}>
			<CardMedia image={logoUrl} title={species} className={styles.media} />
			<CardContent>
				<Typography gutterBottom variant="h5" component="h2" className={styles.cardTitle}>
					{species}
				</Typography>
				{/* Removed className={styles.vertScroll} because didn't exist */}
				<List>{renderAssemblies()}</List>
			</CardContent>
		</Card>
	);
};

const useStyles = makeStyles({
	root: {
		flexGrow: 1
	},
	media: {
		height: 60,
		borderRadius: '10px'
	},
	cardTitle: {
		textTransform: 'capitalize',
		textAlign: 'left'
	},
	card: {
		borderRadius: '10px',
		height: '100%',
		width: '270px'
	},
	alignRight: {
		marginRight: 15,
		marginLeft: 'auto'
	}
});

export default connect(null, callbacks)(GenomePicker);
