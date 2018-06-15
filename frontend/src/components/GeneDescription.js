import PropTypes from "prop-types";
import axios from "axios";
import React from "react";
import Gene from "../model/Gene";
import withCurrentGenome from "./withCurrentGenome";

/**
 * Text that says a gene's description.
 *
 * @author Silas Hsu
 */
class GeneDescription extends React.PureComponent {
  static propTypes = {
    gene: PropTypes.instanceOf(Gene).isRequired, // The Gene object for which to display info
    genomeConfig: PropTypes.object.isRequired,
    collectionName: PropTypes.string.isRequired
  };

  /**
   * Gets gene description by calling an API.
   *
   * @return {Promise<string>} - description of the gene
   */
  async getDescription() {
    const { gene, genomeConfig, collectionName } = this.props;
    try {
      const response = await axios.get(
        `/${genomeConfig.genome.getName()}/genes/${collectionName}/${
          gene.id
        }/description`
      );
      return response.data.description || "";
    } catch (error) {
      return "";
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      description: "Loading..."
    };
    this.getDescription()
      .then(description => this.setState({ description: description }))
      .catch(error => {
        console.error(error);
        this.setState({ description: "(Error getting description)" });
      });
  }

  render() {
    return this.state.description || "(no description found)";
  }
}

export default withCurrentGenome(GeneDescription);
