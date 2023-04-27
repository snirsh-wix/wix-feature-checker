const hasWixDropdownMenu = () => Boolean(document.getElementsByTagName('wix-dropdown-menu').length > 0);
const hasWixVideo = () => Boolean(document.getElementsByTagName('wix-video').length > 0);
const hasPlatform = () => window.fedops.data.platformOnSite;
const hasScreenIn = () => {
    return window.debugApi.getAllLoadedFeatures().includes('screenIn');
}

const hasPGOnFold = () => {
    const layoutData = debugApi.beckyModel.data.layout_data
    const structure =  debugApi.beckyModel.structure
    const getCompLayoutPerBp = (comp) => {
        const compLayout = layoutData[comp.layoutQuery]

        if (!compLayout) {
            return []
        }
        if (compLayout.type !== 'RefArray') {
            return [compLayout]
        }

        return compLayout.values.reduce((acc, layoutPointer) => {
            const layoutValue = layoutData[layoutPointer.replace('#', '')]
            if(layoutValue.type !== 'VariantRelation') {
                acc[''] = layoutValue
            } else {
                const layoutVariants = layoutValue.variants;
                if(layoutVariants.length === 1 && debugApi.beckyModel.data.variants_data[layoutVariants[0].replace('#','')].type === 'BreakpointRange') {
                    acc[layoutVariants[0]] = layoutData[layoutValue.to.replace('#', '')]
                }
            }
            return acc;
        }, [])
    }

    const rowStartToBpTpCompMap = Object.keys(structure).reduce(
        (accRowStartToComp, compId) => {
            const comp = structure[compId]
            const isSection = comp.componentType.toLowerCase().includes('section') && comp.componentType !== 'FooterSection'

            if (!isSection) {
                return accRowStartToComp
            }

            const compLayoutsPerBp = getCompLayoutPerBp(comp)

            Object.keys(compLayoutsPerBp).forEach(
                (bp) => {
                    const compLayout = compLayoutsPerBp[bp]
                    const itemLayout = (compLayout).itemLayout
                    const gridArea = itemLayout?.gridArea
                    if (!(compLayout).componentLayout?.hidden && gridArea?.rowStart) {
                        accRowStartToComp[bp] = accRowStartToComp[bp] || {}

                        const rowStartNum = Number.parseInt(gridArea.rowStart, 10)
                        accRowStartToComp[bp][rowStartNum] = accRowStartToComp[bp][rowStartNum] || []
                        accRowStartToComp[bp][rowStartNum].push(compId)
                    }
                },
                {}
            )

            return accRowStartToComp
        },
        {}
    )

    const firstSectionRows = Object.keys(rowStartToBpTpCompMap).map((bp) =>
        Object.keys(rowStartToBpTpCompMap[bp]).sort().slice(2, rowStartToBpTpCompMap[bp].length).map(rowStart => rowStartToBpTpCompMap[bp][rowStart])).flat().flat()

    const getAllChildrenReq = (compId) => {
        if(!structure[compId]) {
            return []
        }
        if(!structure[compId].components || structure[compId].components.length === 0) {
            return [compId]
        }
        const children = structure[compId].components.map(child => getAllChildrenReq(child)).flat()
        children.push(compId)
        return children
    }

    const firstSectionsComps = firstSectionRows.flat().flat().map(getAllChildrenReq).flat()

    const proGalleryComps = firstSectionsComps.filter((compId) => {
        const dataQuery = structure[compId].dataQuery
        if(!dataQuery) {
            return false;
        }
        const compData = debugApi.beckyModel.data.document_data[dataQuery.replace('#','')]
        const applicationId = compData.applicationId
        if(!applicationId) {
            return false;
        }

        const widgetData = debugApi.siteModels.rendererModel.clientSpecMap[applicationId]

        return widgetData?.appDefinitionName === 'Wix Pro Gallery' || false

    })


    return proGalleryComps.length > 0
}

module.exports = {
    hasWixDropdownMenu,
    hasWixVideo,
    hasPlatform,
    hasScreenIn,
    hasPGOnFold
}
