/**
 * An object that designs visualizations.  A Designer's design() method returns an array of object for a component to
 * interpret.  This provides flexibility: a Designer can make a design without worrying about specifics of <canvas>,
 * <svg>, etc.
 * 
 * @author Silas Hsu
 */
class Designer {
    design() {
        throw new Error("Not implemented");
    }
}

export default Designer;
