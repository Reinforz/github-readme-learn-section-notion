const core = require('@actions/core');
const NotionEndpoints = require("@nishans/endpoints")

async function main(){
  try {
    const databaseId = core.getInput('database_id');
    const collectionViewData = await NotionEndpoints.Queries.syncRecordValues({
      requests: [
        {
          id: databaseId,
          table: 'block',
          version: -1
        }
      ]
    }, {
      token: NOTION_TOKEN_V2,
    })


    // If a database with the passed id doesn't exist
    if(!collectionViewData.recordMap.block[databaseId].value){
      core.setFailed(`Either your NOTION_TOKEN_V2 has expired or a database with id:${databaseId} doesn't exist`);
    }

    const collection_id = collectionViewData.recordMap.block[databaseId].value.collection_id;
    const collectionData = await NotionEndpoints.Queries.syncRecordValues({
      requests: [
        {
          id: collection_id,
          table: 'collection',
          version: -1
        }
      ]
    }, {
      token: NOTION_TOKEN_V2,
    });

    const { recordMap } = await NotionEndpoints.Queries.queryCollection(
      {
        collectionId: collection_id,
        collectionViewId: '',
        query: {},
        loader: {
          type: 'table',
          loadContentCover: false,
          limit: 10000,
          userTimeZone: ''
        }
      },
      {
        token: NOTION_TOKEN_V2
      }
    );

    const collection = collectionData.recordMap.collection[collection_id].value;
    const {schema} = collection;

    // Validate collection schema
    const schema_entries = Object.entries(schema), 
      icon_schema_entry = schema_entries.find(([,schema_entry_value])=>schema_entry_value.type === "url" && schema_entry_value.name === "Icon"),
      category_schema_entry = schema_entries.find(([,schema_entry_value])=>schema_entry_value.type === "multi_select" && schema_entry_value.name === "Category");
    if(!icon_schema_entry)
      core.setFailed("Couldn't find Icon named url type column in the database");
    if(!category_schema_entry)
      core.setFailed("Couldn't find Category named multi_select type column in the database");

    const rows = Object.values(recordMap.block).filter(block=>block.value.id !== databaseId).map(block=>block.value);
    
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

main();