import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get("window");
const ITEM_SPACING = 15;
const ITEM_WIDTH = (width - 30 - (ITEM_SPACING * 2)) / 3; 
const ITEM_HEIGHT = ITEM_WIDTH; 

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        right: 46,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        color: '#000',
        fontWeight: '400',
        marginTop: 60,
        marginBottom: 8,
        marginLeft: 46,
    },
    itemContainer: {
        width: '100%',
        backgroundColor: "#F7F7F7",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingTop: 30,
        minHeight: 100,
        maxHeight: '70%',
        justifyContent: 'center'
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        paddingHorizontal: 15,
    },
    itemCard: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        marginBottom: ITEM_SPACING,
        marginRight: 10,
        marginLeft: 10,
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E1E1E1',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outfitItemsGrid: {
        width: "90%",
        height: "90%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",

    },
    outfitItem: {
        width: "45%",
        height: "45%",
        margin: "2%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: 5,
    },
    outfitItemImage: {
        width: "100%",
        height: "100%",
    },
    outfitItemPlaceholder: {
        fontSize: 10,
        color: "#888",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '400',
    },
    additionalAddButtonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',

    },
    addNewContainer: {
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',


    },
    addNewText: {
        fontSize: 32,
        fontWeight: '300',
        color: '#888',
    },
    columnWrapper: {
        justifyContent: 'flex-start',

    }
}); 