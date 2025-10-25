<script>
  import {
    Accordion,
    AccordionItem,
  } from "$lib/components/Accordion/Accordion";

  let details = [
    {
      title: "About the App",
      content: "Some information about the app goes here",
    },
    {
      title: "Contact Details",
      content: "Contact us at example@email.com",
    },
    {
      title: "Contribute",
      content: "Information about contributing to this project",
    },
  ];
</script>

<h1>About this site</h1>

<section>
  <Accordion --accordion-width="50%" colapse>
    {#each details as detail, i}
      <AccordionItem open={i == 0 ? true : false}>
        <h1 slot="title">{detail.title}</h1>
        <p slot="content">{detail.content}</p>
      </AccordionItem>
    {/each}
  </Accordion>
</section>

<style>
  section {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
