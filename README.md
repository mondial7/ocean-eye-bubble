# \<ocean-eye-bubble\>

Container of an information item for Startup Radiator dashboard

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/mondial7/ocean-eye-bubble)

<!--
```
<custom-element-demo>
  <template>
    <link rel="import" href="ocean-eye-bubble.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<ocean-eye-bubble id="bubble" color="orange">
  <div style="text-align:center;color:#888;font-family:Arial,san-serif;">
    <h1 style="font-size:45px">87%</h1>
    <p>Anything you like</p>
  </div>
</ocean-eye-bubble>
<script>
document.getElementById('bubble').onclick = function(){
  this.togglePosition()
}
</script>
```
